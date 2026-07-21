# Aurora — Minimum Viable Client (MVC) Specification

**Version:** 2.0  
**Status:** Living Document  
**Last Updated:** May 2026  

---

## 📋 Table of Contents

- [Executive Summary](#executive-summary)
- [Core Philosophy](#core-philosophy)
- [Feature List](#feature-list)
- [Detailed Specifications](#detailed-specifications)
- [Opportunity Feed](#opportunity-feed)
- [User Flows](#user-flows)
- [Excluded Features](#excluded-features)
- [Success Criteria](#success-criteria)
- [Technical Constraints](#technical-constraints)

---

## Executive Summary

### The Shift in Thinking

> **Don't ask "What features should the MVP have?"**  
> **Ask "What does a salon need to stop paying for another appointment software?"**

This changes everything.

Most appointment software does this:

```
Calendar → Appointments → Invoices → Done.
```

Aurora should say:

> **"Here's ₹28,000 you can recover this week."**

That's memorable. That's why they'll switch.

---

### MVC Definition

> **"The MVC succeeds when a salon owner opens Aurora every morning to see what they can do today to make more money—and takes action."**

---

### Why Authentication is Required

After reconsideration, **authentication is necessary** for:

| Use Case | Reason |
|----------|--------|
| Owner checks tomorrow's appointments from home | Cloud sync required |
| Receptionist uses desktop | Same data, different device |
| Owner uses tablet while walking the floor | Real-time updates |
| Manager checks performance at night | Remote access |

**Authentication enables cloud sync across devices.**

### Why Multi-Tenancy is Designed In

We design for multi-tenancy but don't expose it initially.

```
Database
    │
    └── Business (1 per account initially)
            │
            ├── Appointments
            ├── Customers
            ├── Staff
            ├── Services
            └── ...
```

**Every table has `BusinessId`.**  
**Your code always filters by `BusinessId`.**

Later you become SaaS simply by changing onboarding. This costs very little if designed from day one.

Multi-Tenant Strategy

Aurora uses a shared database with logical tenant isolation.

Each business is assigned a unique BusinessId.

Every business-owned entity references BusinessId.

Every authenticated request resolves BusinessId from the authenticated user.

Repositories automatically filter every query using BusinessId.

The UI currently allows one business per account.

The architecture supports multiple businesses without database changes.
---

## Core Philosophy

### The "Opportunity Feed" Principle

Instead of hiding AI behind a menu, make it the first thing the owner sees.

```
─────────────────────────────
Good Morning!

Today you have 5 opportunities.

🟢 3 empty slots worth ₹7,500
🟡 18 inactive customers
🟢 2 birthdays today
🟢 Priya is booked 100%
🟡 Neha is booked only 40%

[Review Opportunities]
─────────────────────────────
```

**This is NOT a chatbot.**  
**This is a prioritized task list.**

It directly answers: *"What should I do today to improve my business?"*

---

### The Three Questions

Every morning, Aurora answers:

| Question | How Aurora Answers |
|----------|-------------------|
| **What needs my attention today?** | Opportunity Feed |
| **Where am I losing money?** | Empty slots, inactive customers |
| **What action should I take next?** | One-click campaigns |

---

## Feature List

### Foundation (Must Have)

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | **Authentication** | Login/Register with email | P0 |
| 2 | **Business Profile** | Business name, logo, details | P0 |
| 3 | **Working Hours** | Opening hours, lunch breaks | P0 |
| 4 | **Services** | Service catalog with pricing | P0 |
| 5 | **Staff** | Staff management with availability | P0 |

### Daily Operations (Must Have)

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 6 | **Dashboard** | Smart dashboard with widgets | P0 |
| 7 | **Calendar** | Day/Week/Month views | P0 |
| 8 | **Appointment Management** | CRUD with status | P0 |
| 9 | **Customer Management** | Profiles with history | P0 |
| 10 | **Basic Billing** | Lightweight invoice generation | P0 |

### Growth Engine ⭐ (Aurora's Hero)

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 11 | **Opportunity Feed** | Prioritized task list | P0 |
| 12 | **Empty Slot Detection** | Identify and fill gaps | P0 |
| 13 | **Inactive Customers** | Re-engagement opportunities | P0 |
| 14 | **Birthday Opportunities** | Birthday promotions | P0 |
| 15 | **Suggested Campaigns** | One-click WhatsApp campaigns | P0 |

### Customer Experience (Important)

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 16 | **Online Booking** | Public booking page | P1 |
| 17 | **Booking Confirmation** | Auto-confirmation | P1 |
| 18 | **Appointment Reminder** | Auto-reminders | P1 |

---

## Detailed Specifications

---

## 1. Authentication

**Purpose:** Secure access across devices with cloud sync.

### Features

| Feature | Description |
|---------|-------------|
| Sign Up | Email + password registration |
| Sign In | Email + password authentication |
| Sign Out | Session termination |
| Business Creation | Create business profile on sign up |
| Single Business | One business per account (for now) |

### Flow

```
User Signs Up
       ↓
Creates Business Profile
       ↓
Logs In
       ↓
Sees Their Business Data
       ↓
Logs In From Any Device → Same Data
```

### UI

```
┌─────────────────────────────────────────────────────────────┐
│  Aurora                                                    │
│  Growth Operating System for Appointment Businesses        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Sign In                                           │   │
│  │                                                   │   │
│  │  Email                                            │   │
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

## 2. Business Profile

**Purpose:** Configure business details.

### Data Model

```typescript
interface Business {
  id: string;
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone: string;
  currency: string;
  workingHours: WorkingHours;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

interface DayHours {
  isOpen: boolean;
  open: string; // "09:00"
  close: string; // "18:00"
  breaks: { start: string; end: string }[];
}
```

### UI

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Business Settings                                      │
├─────────────────────────────────────────────────────────────┤
│  Business Name:                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Glow Skin Clinic                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  Working Hours:                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Monday    09:00 ─── 18:00   [Edit]              │   │
│  │  Tuesday   09:00 ─── 18:00   [Edit]              │   │
│  │  Wednesday 09:00 ─── 18:00   [Edit]              │   │
│  │  Thursday  09:00 ─── 18:00   [Edit]              │   │
│  │  Friday    09:00 ─── 18:00   [Edit]              │   │
│  │  Saturday  10:00 ─── 16:00   [Edit]              │   │
│  │  Sunday    Closed             [Edit]              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Working Hours

**Purpose:** Define business operating hours for accurate scheduling.

### Features

| Feature | Description |
|---------|-------------|
| Daily Hours | Set open/close per day |
| Breaks | Lunch breaks per day |
| Day Off | Mark closed days |
| Time Slots | Auto-generate from working hours |

### Business Rules

- Appointments cannot be booked outside working hours
- Staff availability respects working hours
- Breaks are blocked in calendar

---

## 4. Services

**Purpose:** Manage service catalog.

### Data Model

```typescript
interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // minutes
  price: number;
  category: string;
  isActive: boolean;
}
```

### UI

```
┌─────────────────────────────────────────────────────────────┐
│  💇 Services                                               │
├─────────────────────────────────────────────────────────────┤
│  [+ Add Service]                                           │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  HydraFacial       ₹2,500  60 min   Active   [✏️] │   │
│  │  Chemical Peel     ₹3,500  45 min   Active   [✏️] │   │
│  │  Laser Session     ₹4,000  30 min   Active   [✏️] │   │
│  │  Hair Cut          ₹1,000  45 min   Active   [✏️] │   │
│  │  Hair Color        ₹3,000  90 min   Inactive [✏️] │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Staff

**Purpose:** Manage staff with availability and services.

### Data Model

```typescript
interface Staff {
  id: string;
  name: string;
  role: string;
  color: string; // Calendar color
  services: string[]; // Service IDs
  isActive: boolean;
  schedule: StaffSchedule;
}

interface StaffSchedule {
  monday: { isWorking: boolean; start: string; end: string; breaks: { start: string; end: string }[] };
  // ... other days
}
```

### UI

```
┌─────────────────────────────────────────────────────────────┐
│  👥 Staff                                                  │
├─────────────────────────────────────────────────────────────┤
│  [+ Add Staff]                                             │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🟣 Priya Sharma     Skin Therapist  Active        │   │
│  │  Services: HydraFacial, Chemical Peel              │   │
│  │  Today: 09:00-18:00 (Lunch 13:00-14:00)           │   │
│  │  [Edit] [Schedule]                                 │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  🟢 Neha Verma       Hair Stylist    Active        │   │
│  │  Services: Hair Cut, Hair Color                   │   │
│  │  Today: 10:00-18:00                               │   │
│  │  [Edit] [Schedule]                                 │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  🔵 Dr. Arjun        Dermatologist  Active        │   │
│  │  Services: Laser Session, Consultation            │   │
│  │  Today: Off (Roster day)                          │   │
│  │  [Edit] [Schedule]                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Dashboard (Smart Dashboard)

**Purpose:** Business owner's morning briefing with actionable widgets.

### Philosophy

**No separate Reports page.**

Instead, the dashboard contains everything clickable.

```
┌─────────────────────────────────────────────────────────────┐
│  Good Morning, Saba! 🎉                                   │
│  Here's what's happening at Glow Skin Clinic.             │
├─────────────────────────────────────────────────────────────┤
│  Opportunity Feed (Hero) ⭐                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Today you have 5 opportunities.                   │   │
│  │  🟢 3 empty slots worth ₹7,500                    │   │
│  │  🟡 18 inactive customers                          │   │
│  │  🟢 2 birthdays today                              │   │
│  │  🟢 Priya is booked 100%                           │   │
│  │  🟡 Neha is booked only 40%                        │   │
│  │  [Review Opportunities →]                          │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  📊 Today's Overview                                      │
│  ┌──────────────┬──────────────┬──────────────┬─────────┐│
│  │  Revenue     │ Appointments │  Occupancy   │  New    ││
│  │  Today       │  Today       │              │ Clients ││
│  │  ₹38,500     │  24          │  68%         │  5      ││
│  │  ↑ 18%       │  ↑ 4         │  ↑ 12%       │  ↑ 2    ││
│  └──────────────┴──────────────┴──────────────┴─────────┘│
├─────────────────────────────────────────────────────────────┤
│  📈 Revenue This Month: ₹4,28,500  ↑ 14%                  │
├─────────────────────────────────────────────────────────────┤
│  📅 Today's Timeline (Next 5 appointments)                │
│  9:00 AM  │ Anita Singh  │ HydraFacial  │ Priya          │
│  10:00 AM │ Neha Sharma  │ Chemical Peel│ Neha           │
│  11:00 AM │ (Empty)      │              │                │
│  12:00 PM │ Riya Kapoor  │ Laser        │ Riya           │
│  1:00 PM  │ Saba Ali     │ Hair Color   │ Neha           │
│  [View Full Calendar →]                                   │
├─────────────────────────────────────────────────────────────┤
│  🎂 Upcoming Birthdays                                     │
│  14 Feb  │ Anita Singh  │ Send Offer                     │
│  15 Feb  │ Neha Sharma  │ Send Offer                     │
├─────────────────────────────────────────────────────────────┤
│  🔄 Returning Customers                                    │
│  3 clients are coming back after 30+ days                 │
│  [Send Re-engagement →]                                   │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Widgets

| Widget | Description | Click Action |
|--------|-------------|--------------|
| **Opportunity Feed** | Prioritized task list | Open opportunities |
| **Revenue Today** | Today's revenue with trend | Show daily breakdown |
| **Revenue This Month** | Monthly revenue with trend | Show monthly breakdown |
| **Appointments Today** | Count with change | Show today's schedule |
| **Occupancy** | Staff utilization | Show staff occupancy |
| **New Clients** | First-time clients | Show new clients list |
| **Today's Timeline** | Next 5 appointments | Open full calendar |
| **Empty Slots** | Upcoming empty slots | Create campaign |
| **Upcoming Birthdays** | Clients with birthdays | Send offers |
| **Returning Customers** | Clients returning soon | Send re-engagement |
| **AI Insights** | Quick AI suggestions | Review suggestions |
| **Campaign Results** | Campaign performance | Show details |

---

## 7. Calendar

**Purpose:** Visual schedule management with staff slots.

### Views

| View | Description |
|------|-------------|
| **Day View** | Hourly timeline showing all staff |
| **Week View** | 7-day grid with staff columns |
| **Month View** | Calendar grid with appointment indicators |

### Staff View

Each staff member has:

- Color-coded appointments
- Working hours displayed
- Break times shown
- Off days marked

### UI

```
┌─────────────────────────────────────────────────────────────┐
│  📅 May 24, 2026                          [<] [Today] [>]  │
│  [Day] [Week] [Month]                                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┬──────────┬──────────┬──────────┐            │
│  │ Time    │ Priya    │ Neha     │ Riya     │            │
│  ├─────────┼──────────┼──────────┼──────────┤            │
│  │ 9:00    │ Anita    │          │          │            │
│  │         │ Hydra    │          │          │            │
│  ├─────────┼──────────┼──────────┼──────────┤            │
│  │ 10:00   │          │ Neha     │          │            │
│  │         │          │ Chemical │          │            │
│  ├─────────┼──────────┼──────────┼──────────┤            │
│  │ 11:00   │          │          │          │            │
│  │         │  EMPTY   │  EMPTY   │  EMPTY   │            │
│  ├─────────┼──────────┼──────────┼──────────┤            │
│  │ 12:00   │          │          │ Riya     │            │
│  │         │          │          │ Laser    │            │
│  └─────────┴──────────┴──────────┴──────────┘            │
│                                                           │
│  💡 3 empty slots today                                   │
│  [Create Campaign]                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Appointment Management

**Purpose:** Complete appointment lifecycle management.

### Status Flow

```
Scheduled → Confirmed → In Progress → Completed
     ↓           ↓
  Cancelled   No-Show
```

### Appointment Card

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 11:00 AM                    │ Status: Confirmed    │   │
│  │ HydraFacial                 │ 60 minutes           │   │
│  │ Anita Singh                 │ Staff: Priya         │   │
│  │ ✆ +91 98765 43210           │                      │   │
│  │ 📝 Notes: Prefers organic   │                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                           │
│  [Confirm] [Reschedule] [Cancel] [Edit]                   │
└─────────────────────────────────────────────────────────────┘
```

### Booking Flow

```
Step 1: Select Staff
   ↓
Step 2: Select Date
   ↓
Step 3: Select Time (from available)
   ↓
Step 4: Select/Add Client
   ↓
Step 5: Select Service
   ↓
Step 6: Confirm Booking
```

---

## 9. Customer Management

**Purpose:** Complete customer profiles with history.

### Customer Profile

```
┌─────────────────────────────────────────────────────────────┐
│  👤 Anita Singh                                            │
│  +91 98765 43210  ✉ anita.singh@gmail.com                 │
│  Total Visits: 12  │  Last Visit: 10 May 2025             │
│                                                           │
│  📋 Personal Details                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Birthday: 14 Feb 1991                              │   │
│  │ Gender: Female                                     │   │
│  │ Preferred Staff: Priya                             │   │
│  │ Notes: Prefers organic products. Sensitive to     │   │
│  │        strong fragrances.                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  📊 Stats                                                  │
│  Total Spent: ₹28,500  │  Average Visit: ₹2,375          │
│  Days Since Last Visit: 14  │  Next Birthday: 14 Feb     │
│                                                           │
│  📋 Service History                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 10 May 2025  │ HydraFacial       │ ₹2,500        │   │
│  │ 28 Apr 2025  │ Chemical Peel     │ ₹3,500        │   │
│  │ 15 Apr 2025  │ HydraFacial       │ ₹2,500        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  [Book Appointment] [Send Message]                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Basic Billing

**Purpose:** Lightweight invoice generation.

### Flow

```
Appointment Completed
       ↓
Click "Complete"
       ↓
Invoice Generated
       ↓
Payment Recorded
       ↓
Customer History Updated
```

### Invoice View

```
┌─────────────────────────────────────────────────────────────┐
│  INVOICE #INV-2026-001                                     │
│  Glow Skin Clinic                                          │
│  Date: 24 May 2026                                         │
├─────────────────────────────────────────────────────────────┤
│  Customer: Anita Singh                                     │
├─────────────────────────────────────────────────────────────┤
│  Service          Qty    Price    Total                    │
│  HydraFacial      1      ₹2,500   ₹2,500                  │
├─────────────────────────────────────────────────────────────┤
│  Total:                                ₹2,500              │
│  Payment:                               ₹2,500 Paid ✅     │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Opportunity Feed ⭐ (Hero Feature)

**Purpose:** Aurora's hero feature—prioritized task list for business growth.

### Philosophy

Most appointment software does this:

```
Calendar → Appointments → Invoices → Done.
```

Aurora says:

> **"Here's ₹28,000 you can recover this week."**

### Feed Display

```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ Today's Opportunities                                  │
│                                                           │
│  Today you have 5 opportunities.                         │
│                                                           │
│  🟢 3 empty slots worth ₹7,500                            │
│  🟡 18 inactive customers                                 │
│  🟢 2 birthdays today                                     │
│  🟢 Priya is booked 100%                                  │
│  🟡 Neha is booked only 40%                               │
│                                                           │
│  [Review All Opportunities →]                             │
└─────────────────────────────────────────────────────────────┘
```

### Opportunity Types

| Opportunity | Detection | Priority |
|-------------|-----------|----------|
| **Empty Slots** | Tomorrow's schedule gaps | High |
| **Inactive Customers** | 90+ days no visit | High |
| **Birthdays** | Next 7 days | Medium |
| **Staff Overbooked** | > 90% booked | Medium |
| **Staff Underbooked** | < 50% booked | Medium |
| **Revenue Opportunity** | Potential recovery > ₹5,000 | High |

### Priority Colors

| Color | Meaning |
|-------|---------|
| 🟢 | Green — Take action now |
| 🟡 | Yellow — Should be addressed |
| 🔵 | Blue — Informational |

---

## 12. Empty Slot Detection

**Purpose:** Identify and fill empty appointment slots.

### Detection Logic

```
Look at tomorrow's schedule
  ↓
Find gaps between appointments
  ↓
Calculate duration of each gap
  ↓
Estimate potential revenue per gap
  ↓
Group by staff member
  ↓
Present as opportunity
```

### Display

```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ Empty Slots Tomorrow                                   │
│                                                           │
│  You have 7 empty slots tomorrow                         │
│  Estimated lost revenue: ₹14,200                          │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Priya: 3 slots (1 PM - 4 PM)    ₹6,000            │   │
│  │  Neha:  2 slots (11 AM - 1 PM)   ₹4,200            │   │
│  │  Riya:  2 slots (2 PM - 5 PM)    ₹4,000            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  [Create Campaign →]                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 13. Inactive Customers

**Purpose:** Re-engage customers who haven't visited.

### Detection Logic

```
Query customers with:
  - Last visit > 90 days ago
  - No upcoming appointments
  - Active phone number

Calculate:
  - Average spend per customer
  - Total potential revenue

Group by:
  - High value (> ₹5,000 CLV)
  - Medium value (₹2,000-5,000 CLV)
  - Low value (< ₹2,000 CLV)
```

### Display

```
┌─────────────────────────────────────────────────────────────┐
│  🔄 Inactive Customers                                     │
│                                                           │
│  42 customers haven't visited in 90+ days                │
│  Average spend: ₹4,300 per customer                       │
│  Potential revenue: ₹1,82,000                             │
│                                                           │
│  Filter:                                                   │
│  [All 42] [High Value 15] [Medium 18] [Low 9]           │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Anita Singh   ₹28,500 CLV   Last: 10 May 2025    │   │
│  │  Neha Sharma   ₹18,000 CLV   Last: 28 Apr 2025    │   │
│  │  Riya Kapoor   ₹45,000 CLV   Last: 15 Apr 2025    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  [Re-engage Now →]                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 14. Birthday Opportunities

**Purpose:** Send birthday promotions to clients.

### Detection Logic

```
Query customers with:
  - Birthday in next 7 days
  - Active phone number
  - Not recently contacted

Sort by:
  - CLV (high value first)
  - Date (soonest first)
```

### Display

```
┌─────────────────────────────────────────────────────────────┐
│  🎂 Upcoming Birthdays                                     │
│                                                           │
│  8 birthdays in the next 7 days                           │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  14 Feb  │ Anita Singh  │ 1991   │ ₹28,500 CLV   │   │
│  │  15 Feb  │ Neha Sharma  │ 1990   │ ₹18,000 CLV   │   │
│  │  16 Feb  │ Riya Kapoor  │ 1992   │ ₹45,000 CLV   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  [Send Birthday Offers →]                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 15. Suggested Campaigns

**Purpose:** One-click WhatsApp campaigns.

### Campaign Creation (4 Clicks)

```
Opportunity
    ↓
Suggested Audience
    ↓
Suggested WhatsApp Message
    ↓
Review
    ↓
Send
```

### UI

```
┌─────────────────────────────────────────────────────────────┐
│  📢 Create Campaign                                        │
├─────────────────────────────────────────────────────────────┤
│  Opportunity: Empty Slots Tomorrow                         │
│  Target: 7 slots, estimated revenue ₹14,200               │
│                                                           │
│  Suggested Audience:                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ✅ 62 active customers last 30 days               │   │
│  │  ✅ Prefer morning appointments                    │   │
│  │  ✅ Have spent > ₹2,000 per visit                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  Suggested Message:                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  "Hi {name}! Special offer: Book a HydraFacial    │   │
│  │  this week and get 20% off. Valid for limited     │   │
│  │  slots. Reply BOOK to reserve your slot."         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  Expected: 6-9 bookings, ₹18,000+ revenue                 │
│                                                           │
│  [Send Campaign]  [Edit Campaign]                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 16. Online Booking

**Purpose:** Allow customers to book without calling.

### Booking Flow

```
Customer visits: business.aurora.app
         ↓
    Select Service
         ↓
    Select Staff (optional)
         ↓
    Select Date & Time
         ↓
    Enter Contact Details
         ↓
    Confirm Booking
         ↓
    Receive WhatsApp Confirmation
```

### UI

```
┌─────────────────────────────────────────────────────────────┐
│  Glow Skin Clinic 🏆                                      │
│  Book your appointment in seconds                         │
├─────────────────────────────────────────────────────────────┤
│  1. Choose Service                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ○ HydraFacial    ₹2,500  60 mins   ⭐4.9          │   │
│  │ ○ Hair Color     ₹3,000  90 mins   ⭐4.8          │   │
│  │ ○ Laser Session  ₹4,000  45 mins   ⭐4.9          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  2. Choose Expert (Optional)                              │
│  Priya  9.5/10  │  Neha  9.3/10  │  Dr. Arjun 9.7/10   │
│                                                           │
│  3. Pick Date & Time                                      │
│  ┌──┬──┬──┬──┬──┐  ┌──────────────┐                      │
│  │Mo│Tu│We│Th│Fr│  │ 9:00  10:00  │                      │
│  │24│25│26│27│28│  │ 11:00 12:00  │                      │
│  └──┴──┴──┴──┴──┘  │ 1:00  2:00   │                      │
│                     │ 3:00  4:00   │                      │
│                     └──────────────┘                      │
│                                                           │
│  4. Your Details                                          │
│  Name: ________  Phone: ________                          │
│  Email: ________ (optional)                               │
│                                                           │
│  [Book Appointment]                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 17. Booking Confirmation

**Purpose:** Auto-confirm bookings.

### Confirmation Message

```
"Hi Anita! ✅

Your HydraFacial with Priya is confirmed for tomorrow at 11:00 AM.

📍 Glow Skin Clinic, Indiranagar, Bangalore

Reply CONFIRM to confirm or RESCHEDULE to change.

We'll send you a reminder before your appointment.

See you soon! ✨"
```

---

## 18. Appointment Reminder

**Purpose:** Auto-remind customers 24 hours before.

### Reminder Message

```
"Hi Anita! 🔔

Reminder: Your HydraFacial with Priya is tomorrow at 11:00 AM.

📍 Glow Skin Clinic, Indiranagar, Bangalore

Please arrive 5 minutes early.

Reply CONFIRM to confirm.

See you tomorrow! ✨"
```

---

## User Flows

### Flow 1: Morning Routine

```
┌─────────────────────────────────────────────────────────────┐
│  1. Open Dashboard                                         │
│         ↓                                                  │
│  2. Review Opportunity Feed (Hero)                         │
│         ↓                                                  │
│  3. Check Today's Overview                                 │
│     - Revenue, Appointments, Occupancy                    │
│         ↓                                                  │
│  4. Review Today's Timeline                                │
│         ↓                                                  │
│  5. Act on Opportunities                                   │
│     - Fill empty slots via campaign                        │
│     - Re-engage inactive clients                           │
│     - Send birthday offers                                 │
└─────────────────────────────────────────────────────────────┘
```

### Flow 2: Booking a Client

```
┌─────────────────────────────────────────────────────────────┐
│  1. Search or Add Client                                   │
│         ↓                                                  │
│  2. Select Service                                         │
│         ↓                                                  │
│  3. Select Staff                                           │
│         ↓                                                  │
│  4. Select Date & Time                                     │
│         ↓                                                  │
│  5. Confirm Booking                                        │
│         ↓                                                  │
│  6. Auto-send Confirmation                                 │
└─────────────────────────────────────────────────────────────┘
```

### Flow 3: Opportunity to Revenue

```
┌─────────────────────────────────────────────────────────────┐
│  1. See Empty Slot Opportunity                             │
│     - 7 slots tomorrow, ₹14,200 potential                 │
│         ↓                                                  │
│  2. Click "Create Campaign"                                │
│         ↓                                                  │
│  3. Review Suggested Audience                              │
│     - 62 active customers                                  │
│         ↓                                                  │
│  4. Review Suggested Message                               │
│     - 20% off offer                                        │
│         ↓                                                  │
│  5. Click "Send"                                           │
│         ↓                                                  │
│  6. Track Results                                          │
│     - 8 bookings generated                                 │
│     - ₹18,500 revenue recovered                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Excluded Features

### Not in MVC

| Feature | Reason | Future |
|---------|--------|--------|
| **Inventory** | Beyond scheduling scope | v2 |
| **Payroll** | HR complexity | v2 |
| **HR** | Beyond core scope | v2 |
| **Attendance** | Beyond core scope | v2 |
| **Accounting** | Beyond core scope | v2 |
| **Expenses** | Beyond core scope | v2 |
| **Loyalty Points** | Add complexity | v2 |
| **Memberships** | Add complexity | v2 |
| **Gift Cards** | Add complexity | v2 |
| **CRM** | Beyond core scope | v2 |
| **Multi-Branch UI** | Infrastructure complexity | v2 |
| **Mobile App** | Web covers needs | v1.5 |
| **Advanced Analytics** | Basic dashboard enough | v2 |

---

## Success Criteria

### MVC Success Definition

> **"The MVC succeeds when a salon owner opens Aurora every morning to see what they can do today to make more money—and takes action."**

### MVC Complete Checklist

```
✅ User can sign up and log in
✅ Business profile configured
✅ Working hours set
✅ Services added
✅ Staff added with availability
✅ Dashboard shows opportunity feed
✅ Calendar displays staff schedule
✅ Appointments can be booked
✅ Appointments can be managed
✅ Customers can be managed
✅ Billing works
✅ Empty slots detected
✅ Inactive customers detected
✅ Birthdays detected
✅ Campaigns can be sent
✅ Online booking works
✅ Confirmations sent
✅ Reminders sent
✅ Data syncs across devices
```

### Business KPIs

| Metric | Current (Manual) | Target (MVC) |
|--------|------------------|--------------|
| Time to View Business Status | 15 min | < 1 min |
| Time to Book Client | 5 min | < 30 sec |
| Empty Slot Fill Rate | 30% | 70% |
| Client Re-engagement | 20% | 45% |
| Birthday Promotions | Manual | Automated |
| Revenue Recovery | Unknown | Visible |
| Staff Utilization Visibility | None | Real-time |

---

## Technical Constraints

### Authentication

| Feature | Technology |
|---------|------------|
| Email/Password | JWT |
| Password Storage | BCrypt |
| Session | 24-hour expiry |
| Refresh Token | Rotated |

### Multi-Tenancy

| Feature | Implementation |
|---------|----------------|
| Data Isolation | BusinessId in every table |
| Queries | Always filter by BusinessId |
| Onboarding | Single business per account |
| Future | SaaS with multiple businesses |

### Storage

| Feature | Technology |
|---------|------------|
| Primary Database | PostgreSQL |
| Sync | Cloud-based API |
| Offline | Local cache |

### Performance

| Metric | Target |
|--------|--------|
| Dashboard Load | < 2 seconds |
| Calendar Load | < 1.5 seconds |
| Booking | < 1 second |
| Opportunity Feed | < 500ms |
| Campaign Send | < 3 seconds |

---

## Acceptance Criteria

### Feature Acceptance

Each feature is complete when:

```
✅ Works with authentication
✅ Multi-tenant ready
✅ Displays data correctly
✅ Accepts user input
✅ Saves changes
✅ Syncs across devices
✅ Shows loading states
✅ Shows empty states
✅ Shows error states
✅ Responsive on desktop/tablet
✅ Keyboard accessible
✅ No console errors
```

---

*This document defines the exact scope of the Aurora MVC v2. The hero feature is the Opportunity Feed that answers: "What should I do today to make more money?"*